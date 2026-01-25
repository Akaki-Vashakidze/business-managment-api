import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { UserService } from "../services/user.service";

@Controller('user')
export class UserController {
    constructor(private userService: UserService) { }

    @Get('get-all-users-minus-owner-and-managers')
    async getAllUsersMinusOwnerAndManagers() {
        return this.userService.getAllUsersMinusOwnerAndManagers();
    }

    @Post('get-filtered-users')
    async getFilteredUsers(@Body() body: { searchQuery: string }) {
        const { searchQuery } = body;
        return this.userService.getFilteredUsers(searchQuery);
    }

    @Get('getById/:userId')
    async getUserById(@Param('userId') userId: string ){
        return this.userService.getUserById(userId)
    }

}
