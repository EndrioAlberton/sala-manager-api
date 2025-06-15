import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1710000000000 implements MigrationInterface {
    name = 'CreateTables1710000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Criar tabela de usuários
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS user (
                id INT NOT NULL AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                userType ENUM('ADMIN', 'PROFESSOR', 'ALUNO') NOT NULL DEFAULT 'ALUNO',
                PRIMARY KEY (id)
            ) ENGINE=InnoDB
        `);

        // Criar tabela de salas
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS class_room (
                id INT NOT NULL AUTO_INCREMENT,
                roomNumber VARCHAR(10) NOT NULL,
                floor INT NOT NULL,
                building VARCHAR(50) NOT NULL,
                desks INT NOT NULL,
                chairs INT NOT NULL,
                computers INT NOT NULL DEFAULT 0,
                hasProjector BOOLEAN NOT NULL DEFAULT false,
                maxStudents INT NOT NULL,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB
        `);

        // Criar tabela de disciplinas base
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS base_discipline (
                id INT NOT NULL AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                code VARCHAR(20) NOT NULL UNIQUE,
                description TEXT,
                area VARCHAR(50) NOT NULL,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB
        `);

        // Criar tabela de disciplinas
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS discipline (
                id INT NOT NULL AUTO_INCREMENT,
                baseDisciplineId INT NOT NULL,
                professorId INT NOT NULL,
                PRIMARY KEY (id),
                FOREIGN KEY (baseDisciplineId) REFERENCES base_discipline(id),
                FOREIGN KEY (professorId) REFERENCES user(id),
                UNIQUE KEY unique_professor_discipline (professorId, baseDisciplineId)
            ) ENGINE=InnoDB
        `);

        // Criar tabela de ocupações
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS occupation (
                id INT NOT NULL AUTO_INCREMENT,
                roomId INT NOT NULL,
                teacher VARCHAR(100) NOT NULL,
                subject VARCHAR(100) NOT NULL,
                startDate DATE NOT NULL,
                endDate DATE NOT NULL,
                startTime TIME NOT NULL,
                endTime TIME NOT NULL,
                daysOfWeek JSON NOT NULL,
                PRIMARY KEY (id),
                FOREIGN KEY (roomId) REFERENCES class_room(id)
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS occupation`);
        await queryRunner.query(`DROP TABLE IF EXISTS discipline`);
        await queryRunner.query(`DROP TABLE IF EXISTS base_discipline`);
        await queryRunner.query(`DROP TABLE IF EXISTS class_room`);
        await queryRunner.query(`DROP TABLE IF EXISTS user`);
    }
} 