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
    },  

/**
 * Rotas de Usuários
 * Base: /users
 */

USERS: {
    // GET /users
    // Lista todos os usuários
    LIST: '/users',

    // GET /users/:id
    // Busca um usuário específico
    GET_BY_ID: '/users/:id',

    // POST /users
    // Cria um novo usuário
    CREATE: '/users',
    // Body: {
    //     "name": string,
    //     "password": string,
    //     "userType": string,
    //     "email": string
    // }

    // PUT /users/:id
    // Atualiza um usuário existente
    UPDATE: '/users/:id',
    // Body: {
    //     "name"?: string,
    //     "password"?: string,
    //     "userType"?: string,
    //     "email"?: string
    // }

    // DELETE /users/:id
    // Remove um usuário
    DELETE: '/users/:id'

},};

