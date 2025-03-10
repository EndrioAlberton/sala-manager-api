export const API_ROUTES = {
    /**
     * Rotas de Salas de Aula
     * Base: /classrooms
     */
    CLASSROOMS: {
        // GET /classrooms
        LIST: '/classrooms',

        // GET /classrooms/available
        AVAILABLE: '/classrooms/available',

        // GET /classrooms/:id
        GET_BY_ID: '/classrooms/:id',

        // POST /classrooms
        CREATE: '/classrooms',

        // PUT /classrooms/:id
        UPDATE: '/classrooms/:id',

        // DELETE /classrooms/:id
        DELETE: '/classrooms/:id',

        // PUT /classrooms/:id/occupy
        OCCUPY: '/classrooms/:id/occupy',

        // PUT /classrooms/:id/vacate
        VACATE: '/classrooms/:id/vacate'
    }
};

