import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { Helper } from "../utils/helper";
import { JwtTokenService } from "../services/jwt-token.service";
import { AuthGuard } from "../guards/auth.guard";

@Controller('user')
export class UserController {
    constructor(private userService: UserService, private jwtTokenService:JwtTokenService) { }

    @UseGuards(AuthGuard)
    @Get('getById/:userId')
    async getUserById(@Param('userId') userId: string ){
        return this.userService.getUserById(userId)
    }

}
