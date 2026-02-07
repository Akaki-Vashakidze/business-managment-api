import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { Helper } from "../utils/helper";
import { JwtTokenService } from "../services/jwt-token.service";

@Controller('user')
export class UserController {
    constructor(private userService: UserService, private jwtTokenService:JwtTokenService) { }

    @Get('get-all-users-minus-owner-and-managers/:businessId')
    async getAllUsersMinusOwnerAndManagers(@Param('businessId') businessId: string) {
        return this.userService.getAllUsersMinusOwnerAndManagers(businessId);
    }

    @Post('get-filtered-users')
    async getFilteredUsers(@Body() body: { searchQuery: string, businessId:string }) {
        const { searchQuery, businessId } = body;
        return this.userService.getFilteredUsers(searchQuery, businessId);
    }

    @Get('getById/:userId')
    async getUserById(@Param('userId') userId: string ){
        return this.userService.getUserById(userId)
    }

    @Post('makeAdminActive')
    async toggleActiveAdmin(@Req() req: Request ){
        const userId = Helper.getUserIdFromHeaderToken(req, this.jwtTokenService);
        return this.userService.makeAdminActive(userId)
    }

    @Post('checkIfAdminIsActive')
    async checkIfAdminIsActive(@Req() req: Request ){
        const userId = Helper.getUserIdFromHeaderToken(req, this.jwtTokenService);
        return this.userService.checkIfAdminIsActive(userId)
    }

}
