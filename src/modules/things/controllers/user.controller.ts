import { Controller, Get, Param, Post } from "@nestjs/common";
import { UserService } from "../services/user.service";

@Controller('user')
export class UserController {
    constructor(private userService: UserService) { }

    @Get('get-all-users-minus-owner-and-managers')
    async getAllUsersMinusOwnerAndManagers() {
        return this.userService.getAllUsersMinusOwnerAndManagers();
    }

    @Post('get-filtered-users/:searchQuery')
    async getFilteredUsers(@Param('searchQuery') searchQuery: string) {
        return this.userService.getFilteredUsers(searchQuery);
    }

}
