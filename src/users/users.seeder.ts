import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

/**
 * Membuat akun admin awal dari environment variable saat aplikasi pertama kali jalan.
 */
@Injectable()
export class UsersSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersSeeder.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');

    if (!email || !password) {
      return;
    }

    const existing = await this.usersService.findByEmail(email);

    if (existing) {
      return;
    }

    await this.usersService.create({
      name: this.configService.get<string>('ADMIN_NAME') ?? 'Administrator',
      email,
      password,
      role: UserRole.Admin,
    });

    this.logger.log(`Akun admin awal dibuat: ${email}`);
  }
}
