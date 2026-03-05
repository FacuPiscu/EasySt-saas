# Contexto General
Actúa como un Arquitecto de Software Senior experto en TypeScript y Node.js. Estamos construyendo "EasySt", un sistema SaaS (Software as a Service) multi-tenant (multi-inquilino) para la gestión de negocios, ventas e inventario.

# Stack Tecnológico
- Backend: Node.js, TypeScript, Express (o Fastify), Prisma ORM, PostgreSQL.
- Frontend: React, Vite, TypeScript, CSS Puro (mediante CSS Modules).
- Estructura: Monorepo usando npm workspaces (o pnpm). Carpetas principales: `apps/backend`, `apps/frontend`, `packages/shared`.

# Reglas de Arquitectura (INQUEBRANTABLES)
1. **Arquitectura Limpia (Clean Architecture):** El backend DEBE dividirse estrictamente en 4 capas:
   - `domain`: Entidades puras y contratos de interfaces (cero dependencias externas, ni Prisma, ni Express).
   - `application`: Casos de uso de negocio (ej. RegisterSaleUseCase).
   - `infrastructure`: Implementación de repositorios (Prisma) y servicios externos.
   - `presentation`: Controladores y rutas REST.
2. **Aislamiento Multi-Tenant:** ABSOLUTAMENTE TODAS las tablas de la base de datos (excepto la tabla `tenants` misma) DEBEN tener una columna `tenant_id`.
3. **Índices Compuestos:** Toda búsqueda frecuente debe tener un índice compuesto en PostgreSQL que inicie con el `tenant_id` (ej. `@@index([tenant_id, name])`).
4. **Roles de Usuario:** El sistema maneja roles. Entidad User: `role: 'ADMIN' | 'CASHIER'`.
5. **Estilos (Frontend):** Prohibido usar Tailwind u otros frameworks de CSS. Se debe utilizar CSS puro. Los estilos globales van en `core/styles/global.css` y los estilos de componentes deben estar co-localizados usando CSS Modules (ej. `Boton.module.css`).

# Reglas Globales de Desarrollo

1. **Idioma Estricto (Código vs Interfaz):**
   - Todo el código fuente (nombres de archivos, carpetas, variables, funciones, clases, componentes, interfaces, tipos) DEBE estar estrictamente en INGLÉS.
   - Todos los textos de la interfaz de usuario (UI), mensajes de error visibles para el cliente, y correos electrónicos generados DEBEN estar en ESPAÑOL.
2. **Comentarios:**
   - NO generes comentarios obvios ni innecesarios para explicar código simple.
   - Redacta los comentarios exclusivamente en 3era persona.
   - Los comentarios deben ser puramente descriptivos y aplicarse ÚNICAMENTE para documentar funciones complejas, lógica de negocio intrincada o decisiones de arquitectura.
3. **Restricción de Emojis:** - Queda estrictamente prohibido el uso de emojis en el código fuente, los comentarios, las confirmaciones de Git (commits) y las explicaciones del chat.
4. **CERO INICIATIVA NO SOLICITADA:** NO HACER NADA QUE YO NO TE PIDA EXPLÍCITAMENTE. Esto incluye abstenerse total y completamente de modificar diseños (CSS), lógicas o refactorizar código sin una instrucción previa clara. Está prohibido alterar elementos que ya funcionaban bajo tu propio criterio visual.

REGLA ESTRICTA DE IDIOMA:
1. El código fuente (nombres de variables, funciones, clases, interfaces, archivos) DEBE estar en INGLÉS.
2. TODOS los comentarios dentro del código (// o /** */) DEBEN estar en ESPAÑOL.
3. Los mensajes de error (throw new Error) DEBEN estar en ESPAÑOL.

# Tarea Actual (Paso 1)
Por favor, inicializa la estructura del monorepo. 
1. Crea los `package.json` para los workspaces.
2. Inicializa Prisma en el backend configurado para PostgreSQL.
3. Escribe el archivo `schema.prisma` inicial con los modelos: `Tenant`, `User`, `Product`, `Sale`, y `SaleItem`, aplicando las reglas multi-tenant e índices compuestos mencionadas arriba.