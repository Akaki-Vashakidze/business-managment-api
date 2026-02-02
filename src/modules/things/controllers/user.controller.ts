import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { UserService } from "../services/user.service";

@Controller('user')
export class UserController {
    constructor(private userService: UserService) { }

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

}
