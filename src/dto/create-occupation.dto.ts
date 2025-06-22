export class CreateOccupationDto {
    roomId: number;
    teacher: string;
    subject: string;
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
    daysOfWeek: string[];
} 