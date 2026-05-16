import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { GameModelStatus } from "../enums/game-model-status.enum";

@Entity({ name: "game_models" })
export class GameModel {
    @ApiProperty({ description: "模型ID", example: 1 })
    @PrimaryGeneratedColumn({ name: "id" })
    id!: number;

    @ApiProperty({ description: "模型名称", example: "默认模型" })
    @Column({ name: "name", length: 100 })
    name!: string;

    @ApiProperty({ description: "模型描述", example: "这是一个默认的游戏模型。" })
    @Column({ name: "description", type: "text" })
    description!: string;

    @ApiProperty({ description: "模型版本", example: "1.0.0" })
    @Column({ name: "version", length: 20 })
    version!: string;

    @ApiProperty({ description: "模型状态", example: "active" })
    @Column({
        name: "status",
        type: "enum",
        enum: GameModelStatus,
        default: GameModelStatus.ACTIVE,
    })
    status!: GameModelStatus;

    @ApiProperty({ description: "开奖间隔时间(秒)", example: 60 })
    @Column({ name: "draw_interval", type: "int", nullable: true })
    drawInterval?: number;

    @ApiProperty({ description: "模型创建时间", example: "2024-01-01T00:00:00Z" })
    @Column({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @ApiProperty({ description: "模型更新时间", example: "2024-01-02T00:00:00Z" })
    @Column({ name: "updated_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt!: Date;
}
