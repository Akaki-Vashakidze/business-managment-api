
import { AccessToken, AccessTokenSchema } from "./access-token.schema";
import { Business, BusinessSchema } from "./business.schema";
import { BusinessBranch, BusinessBranchSchema } from "./businessBranch";
import { EmailVerification, EmailVerificationSchema } from "./email-verification.schema";
import { Item, ItemSchema } from "./item.schema";
import { ItemManagement, ItemManagementSchema } from "./itemManagement.schema";
import { Membership, MembershipSchema } from "./membership.schema";
import { User, UserSchema } from "./user.schema";
import { Visit, VisitSchema } from "./visit.schema";

const MongooseModels = [
  { name: User.name, schema: UserSchema },
  { name: AccessToken.name, schema: AccessTokenSchema },
  { name: EmailVerification.name, schema: EmailVerificationSchema },
  { name: Business.name, schema: BusinessSchema },
  { name: BusinessBranch.name, schema: BusinessBranchSchema },
  { name: Item.name, schema: ItemSchema },
  { name: ItemManagement.name, schema: ItemManagementSchema },
  { name: Membership.name, schema: MembershipSchema },
  { name: Visit.name, schema: VisitSchema },
];

export default MongooseModels;