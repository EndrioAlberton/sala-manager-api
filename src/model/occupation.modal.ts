import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Occupation {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    roomId: number;

    @Column()
    teacher: string;

    @Column()
    subject: string;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @Column()
    startTime: string;

    @Column()
    endTime: string;

    @Column('simple-array')
    daysOfWeek: number[];
} 