import { Prop } from "@nestjs/mongoose"
import { RecordState } from "../../../base/enums/record-state.enum"

export class RecordSchema {

    @Prop({ required: true, type: Number, enum: RecordState, default: RecordState.ACTIVE })
    state: number;

    @Prop({ type: Number, default: 0 })
    isDeleted: number;

    @Prop({ type: Date, default: new Date() })
    createdAt: Date;

    constructor() {
        this.state = RecordState.ACTIVE
        this.isDeleted = 0;
        this.createdAt = new Date();
    }
}