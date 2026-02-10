import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { Helper } from "../utils/helper";
import { JwtTokenService } from "../services/jwt-token.service";
import { AdminService } from "../services/admin.service";

@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService, private jwtTokenService:JwtTokenService) { }

    @Get('get-all-users-minus-owner-and-managers/:businessId')
    async getAllUsersMinusOwnerAndManagers(@Param('businessId') businessId: string) {
        return this.adminService.getAllUsersMinusOwnerAndManagers(businessId);
    }

    @Post('get-filtered-users')
    async getFilteredUsers(@Body() body: { searchQuery: string, businessId:string }) {
        const { searchQuery, businessId } = body;
        return this.adminService.getFilteredUsers(searchQuery, businessId);
    }

    @Post('makeAdminActive')
    async toggleActiveAdmin(@Req() req: Request ){
        const userId = Helper.getUserIdFromHeaderToken(req, this.jwtTokenService);
        return this.adminService.makeAdminActive(userId)
    }

    @Post('checkIfAdminIsActive')
    async checkIfAdminIsActive(@Req() req: Request ){
        const userId = Helper.getUserIdFromHeaderToken(req, this.jwtTokenService);
        return this.adminService.checkIfAdminIsActive(userId)
    }

    @Post('blockUser/:userId')
    async blockUser(@Param('userId') userId: string){
        return this.adminService.blockUser(userId)
    }

    @Post('unblockUser/:userId')
    async unblockUser(@Param('userId') userId: string){
        return this.adminService.unblockUser(userId)
    }

}
