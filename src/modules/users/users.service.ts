/* eslint-disable */
/*
 @auhor : © 2025 Alice Umugwaneza <umugwanezaalice22@gmail.com>
*/

/**
 * @file
 * @brief service for User queries
 */
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { getMongoRepository, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm/dist';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { LoginDTO } from 'src/common/dtos/login.dto';
import { RoleService } from '../roles/role.service';
import { CreateAdminDto } from 'src/common/dtos/create-admin.dto';
import { CreateUserByAdminDto } from 'src/common/dtos/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from 'src/common/dtos/update-user.dto';
import { User } from 'src/entities/user.entity';
import { UtilsService } from '../utils/utils.service';
import { EAccountStatus } from 'src/common/enums/EAccountStatus.enum';
import { ERole } from 'src/common/enums/ERole.enum';
import { EGender } from 'src/common/enums/EGender.enum';
import { MailingService } from 'src/integrations/mailing/mailing.service';
import { EventOrganizer } from 'src/entities/event-organizer.entity';
import { Coordinator } from 'src/entities/coordinator.entity';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) public userRepo: Repository<User>,
    // @Inject(forwardRef(() => RoleService))
    private roleService: RoleService,
    @Inject(forwardRef(() => UtilsService))
    @Inject(forwardRef(() => ConfigService))
    private configService: ConfigService,
    private jwtService: JwtService,
    private utilsService: UtilsService,
    private mailingService: MailingService,
  ) { }

  async getUsers() {
    const response = await this.userRepo.find({ relations: ['roles'] });
    return response;
  }
  async getUserByEmailAndNotDelegate(email: string) {
    const delegateRole = await this.roleService.getRoleByName(ERole.DELEGATE);

    const user = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('user.email = :email', { email })
      .andWhere('role.id != :delegateRoleId', { delegateRoleId: delegateRole.id })
      .getOne();

    if (!user) {
      throw new NotFoundException('The user is either not found or insufficient role! Contact support');
    }
    return user;
  }

  async getUserByEmail(email: any) {
    const user = await this.userRepo.findOne({
      where: {
        email: email,
      },
      relations: ['roles'],
    });
    if (!user)
      throw new NotFoundException(
        'The user with the provided email is not found',
      );
    return user;
  }
  async getUserByVerificationCode(code: number) {
    const user = await this.userRepo.findOne({
      where: {
        activationCode: code,
      },
      relations: ['roles'],
    });
    return user;
  }

  async getOneByEmail(email: any) {
    const user = await this.userRepo.findOne({
      where: {
        email: email,
      },
      relations: ['roles'],
    });
    return user;
  }

  async getUserById(id: string, entity: String) {

    const response = await this.userRepo.findOne({
      where: {
        id: id,
      },
      relations: ['roles'],
    });
    if (!response) {
      throw new NotFoundException(`${entity} not found`);
    }
    return response;
  }

  generateRandomFourDigitNumber(): number {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async login(dto: LoginDTO) {
    const user = await this.getOneByEmail(dto.email);
    if (user.status == EAccountStatus[EAccountStatus.WAIT_EMAIL_VERIFICATION])
      throw new BadRequestException(
        'This account is not yet verified, please check your gmail inbox for verification details',
      );
    const tokens = this.utilsService.getTokens(user);
    delete user.password;
    return {
      access: (await tokens).accessToken,
      refresh_token: (await tokens).refreshToken,
      user: user,
    };
  }

  async verifyAccount(code: number) {
    const verifiedAccount = await this.getUserByVerificationCode(code);
    if (!verifiedAccount)
      throw new BadRequestException(
        'The provided verification code is invalid',
      );
    if (verifiedAccount.status === EAccountStatus[EAccountStatus.ACTIVE])
      throw new BadRequestException('This is already verified');
    verifiedAccount.status = EAccountStatus[EAccountStatus.ACTIVE];
    const updatedAccount = await this.userRepo.save(verifiedAccount);
    const tokens = await this.utilsService.getTokens(updatedAccount);
    delete updatedAccount.password;
    delete updatedAccount.activationCode;

    return { tokens, user: updatedAccount };
  }

  async resetPassword(code: number, newPassword: string) {
    const account = await this.getUserByVerificationCode(code);
    if (!account)
      throw new BadRequestException(
        'The provided code is invalid',
      );

    account.password = await this.utilsService.hashString(
      newPassword.toString(),
    );
    if (
      account.status == EAccountStatus[EAccountStatus.WAIT_EMAIL_VERIFICATION]
    )
      account.status = EAccountStatus[EAccountStatus.ACTIVE]
    const savedUser = await this.userRepo.save(account);
    const tokens = await this.utilsService.getTokens(account);
    delete savedUser.password;
    delete savedUser.activationCode;
    return { tokens, user: savedUser };
  }

  async getVerificationCode(email: string, reset: boolean) {

    const account = await this.getUserByEmail(email);
    if (!account) throw new BadRequestException('This account does not exist');

    account.activationCode = this.generateRandomFourDigitNumber();
    if (reset) account.status = EAccountStatus[EAccountStatus.WAIT_EMAIL_VERIFICATION];
    await this.userRepo.save(account);
    this.mailingService.sendEmail(`${process.env.FRONT_END_URL}/auth/forgot-password?email=${account.email}&code=${account.activationCode}`, true, account);
    return { code: account.activationCode };
  }

  async getResetPasswordToken(email: string, reset: boolean) {
    const account = await this.getUserByEmail(email);
    if (!account) throw new BadRequestException('This account does not exist');
    const tempPassword = uuidv4().replace(/-/g, '').slice(0, length);
    const hashedPassword = await this.utilsService.hashString(tempPassword);
    account.password = hashedPassword;
    account.activationCode = this.generateRandomFourDigitNumber();
    if (reset) account.status = EAccountStatus[EAccountStatus.INACTIVE];
    await this.userRepo.save(account);
    this.mailingService.sendEmail(`${process.env.FRONT_END_URL}/auth/forgot-password?email=${account.email}&code=${account.activationCode}`, true, account);
    return { activationCode: account.activationCode, temporaryPassword: tempPassword };
  }
  //create admin
  async createAdmin(body: CreateAdminDto) {
    let {
      firstName,
      lastName,
      email,
      username,
      myGender,
      registercode,
      national_id,
      phonenumber,
      password,
    } = body;
    if (registercode != process.env.ADMIN_REGISTRATION_KEY) {
      return new UnauthorizedException('Incorrect Registration Key');
    }

    let email2: any = email;
    const userFetched = await this.userRepo.findOne({
      where: {
        email: email2,
      },
    });
    if (userFetched) return new UnauthorizedException('Email already exists');

    const status: String =
      EAccountStatus[EAccountStatus.WAIT_EMAIL_VERIFICATION].toString();
    let gender;
    const role = await this.roleService.getRoleByName(ERole[ERole.ADMIN]);
    switch (myGender.toLowerCase()) {
      case 'male':
        gender = EGender[EGender.MALE];
        break;
      case 'female':
        gender = EGender[EGender.FEMALE];
        break;
      default:
        throw new BadRequestException(
          'The provided gender is invalid, should male or female',
        );
    }
    const userToCreate = new User(
      firstName,
      lastName,
      email,
      username,
      gender,
      national_id,
      phonenumber,
      password,
      EAccountStatus.ACTIVE,
    );
    userToCreate.activationCode = this.generateRandomFourDigitNumber();
    userToCreate.password = await this.utilsService.hashString(password);
    try {
      const userEntity = this.userRepo.create(userToCreate);
      const createdEnity = await this.userRepo.save({ ...userEntity, roles: [role] });
      await this.mailingService.sendEmail(`${process.env.FRONT_END_URL}/auth/forgot-password?email=${createdEnity.email}&code=${createdEnity.activationCode}`, false, createdEnity);
      return {
        success: true,
        message: `Account created successfully!`,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async createUser(body: CreateUserByAdminDto) {
    const {
      firstName,
      lastName,
      email,
      username,
      myGender,
      national_id,
      role,
      phonenumber,
    } = body;

    const existingUser = await this.userRepo.findOne({
      where: { email },
    });

    if (existingUser) throw new UnauthorizedException('Email already exists');

    const tempPassword = uuidv4().replace(/-/g, '').slice(0, 8);
    const hashedPassword = await this.utilsService.hashString(tempPassword);

    const roleEntity = await this.roleService.getRoleByName(role);

    let gender: EGender;
    switch (myGender.toLowerCase()) {
      case 'male':
        gender = EGender.MALE;
        break;
      case 'female':
        gender = EGender.FEMALE;
        break;
      case 'other':
        gender = EGender.OTHER
      default:
        throw new BadRequestException('The provided gender is invalid, should be male or female');
    }

    let userToCreate: User;

    // Instantiate correct subclass based on role
    switch (role) {
      case ERole.EVENT_ORGANIZER:
        userToCreate = new EventOrganizer(
          firstName,
          lastName,
          email,
          username,
          gender,
          national_id,
          phonenumber,
          hashedPassword,
          EAccountStatus.WAIT_EMAIL_VERIFICATION,
        );
        break;

      case ERole.COORDINATOR:
        userToCreate = new Coordinator(
          firstName,
          lastName,
          email,
          username,
          gender,
          national_id,
          phonenumber,
          hashedPassword,
          EAccountStatus.WAIT_EMAIL_VERIFICATION,
        );
        break;

      default:
        userToCreate = new User(
          firstName,
          lastName,
          email,
          username,
          gender,
          national_id,
          phonenumber,
          hashedPassword,
          EAccountStatus.WAIT_EMAIL_VERIFICATION,
        );
    }

    userToCreate.activationCode = this.generateRandomFourDigitNumber();

    try {
      const userEntity = this.userRepo.create(userToCreate);
      const tokens = await this.utilsService.getTokens(userEntity);

      const savedUser = await this.userRepo.save({
        ...userEntity,
        resetToken: tokens.accessToken.toString(),
        roles: [roleEntity],
      });

      await this.mailingService.sendEmail(
        `${process.env.FRONT_END_URL}/auth/forgot-password?email=${savedUser.email}&code=${savedUser.activationCode}`,
        true,
        savedUser,
      );

      return {
        success: true,
        message: `User account created successfully! ${savedUser.activationCode}`,
        password: tempPassword,
        token: savedUser.activationCode,
      };
    } catch (error) {
      console.error('Error while creating user:', error);
      throw new InternalServerErrorException('Something went wrong while creating the user.');
    }
  }




  async verifyProfile(code: number) {
    try {
    } catch (error) {
      console.log(error);
    }
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.getUserById(id, 'User');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, dto);
    const erole = await this.roleService.getRoleByName(dto.role);

    user.roles = [erole];
    return this.userRepo.save(user);
  }
  async assignRoleToUser(userId: string, roleName: any, userType: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const role = this.roleService.roleRepo.findOne({
      where: { role_name: roleName },
    });
    if (!role)
      throw new NotFoundException(
        'The role with the provided id is not foound',
      );

    let roles = [];
    roles = user.roles;
    roles.push(role);
    user.roles = roles;

  }

  async deleteUser(id: string) {
    const user = await this.getUserById(id, 'User');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    this.userRepo.remove(user);
    return user;
  }


}
