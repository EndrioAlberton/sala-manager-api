/**
 * Documentação das Rotas da API
 * Base URL: http://localhost:3000
 */

export const API_ROUTES = {
    /**
     * Rotas de Salas de Aula
     * Base: /classrooms
     */
    CLASSROOMS: {
        // GET /classrooms
        // Lista todas as salas de aula
        LIST: '/classrooms',

        // GET /classrooms/available
        // Lista todas as salas disponíveis
        AVAILABLE: '/classrooms/available',

        // GET /classrooms/:id
        // Busca uma sala específica
        GET_BY_ID: '/classrooms/:id',

        // POST /classrooms
        // Cria uma nova sala
        CREATE: '/classrooms',
        // Body: {
        //     "floor": number,
        //     "building": string,
        //     "desks": number,
        //     "chairs": number,
        //     "computers": number,
        //     "projectors": number,
        //     "maxStudents": number
        // }

        // PUT /classrooms/:id
        // Atualiza uma sala existente
        UPDATE: '/classrooms/:id',
        // Body: {
        //     "floor"?: number,
        //     "building"?: string,
        //     "desks"?: number,
        //     "chairs"?: number,
        //     "computers"?: number,
        //     "projectors"?: number,
        //     "maxStudents"?: number
        // }

        // DELETE /classrooms/:id
        // Remove uma sala
        DELETE: '/classrooms/:id',

        // PUT /classrooms/:id/occupy
        // Ocupa uma sala
        OCCUPY: '/classrooms/:id/occupy',
        // Body: {
        //     "teacher": string,
        //     "subject": string
        // }

        // PUT /classrooms/:id/vacate
        // Libera uma sala
        VACATE: '/classrooms/:id/vacate'
    }
};

/**
 * Exemplos de Uso:
 * 
 * 1. Listar todas as salas:
 * GET http://localhost:3000/classrooms
 * 
 * 2. Criar uma nova sala:
 * POST http://localhost:3000/classrooms
 * {
 *     "floor": 1,
 *     "building": "Prédio A",
 *     "desks": 30,
 *     "chairs": 30,
 *     "computers": 15,
 *     "projectors": 1,
 *     "maxStudents": 30
 * }
 * 
 * 3. Ocupar uma sala:
 * PUT http://localhost:3000/classrooms/1/occupy
 * {
 *     "teacher": "Prof. Silva",
 *     "subject": "Matemática"
 * }
 * 
 * 4. Liberar uma sala:
 * PUT http://localhost:3000/classrooms/1/vacate
 */ 