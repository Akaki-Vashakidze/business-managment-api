import { Body, Controller, Delete, Get, Param, Post, Put, Req } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { BranchDto } from "../dtos/branch.dto";
import { BranchesService } from "../services/branches.service";
import { Helper } from "../utils/helper";
import { JwtTokenService } from "../services/jwt-token.service";

@Controller('Branch')
export class BranchController {
    constructor(private readonly branchesService: BranchesService, private jwtTokenService: JwtTokenService) { }

    @Post('create-Branch')
    async createBranch(@Body() BranchData: BranchDto, @Req() req: Request) {
        const userId = Helper.getUserIdFromHeaderToken(req, this.jwtTokenService);
        return this.branchesService.createBranch(BranchData, userId);
    }

    @Get('get-branches-by-business/:businessId')
    async getBranchesByBusiness(@Param('businessId') businessId: string) {
        return this.branchesService.getBranchesByBusiness(businessId);
    }

    @Delete('delete-Branch/:BranchId')
    async deleteBranch(@Param('BranchId') BranchId: string) {
    return this.branchesService.deleteBranch(BranchId);
    }

    @Put('update-Branch/:BranchId')
    async updateBranch(@Param('BranchId') BranchId: string, @Body() BranchData: {name:string}) {
        return this.branchesService.updateBranch(BranchId, BranchData);
    }   
}
