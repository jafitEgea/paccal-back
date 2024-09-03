import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Constants } from 'src/assets/environment/constants';
import { LoginDto, RegisterDto } from 'src/usuarios/dto/create-usuario.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post('register')
    async register(@Body() body: RegisterDto) {
        try {
            const data = await this.authService.register(body);
            return {
                success: true,
                action: Constants.INSERT,
                data,
                message: 'Usuario creado exitosamente',
            };
        } catch (error) { throw error }
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() body: LoginDto) {
        try {
            return await this.authService.login(body);
        } catch (error) { throw error }
    }
}
