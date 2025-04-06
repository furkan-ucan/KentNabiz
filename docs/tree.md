KentNabiz
├── .env
├── .env.example
├── .git
├── .github
│ ├── README.md
│ ├── ruleset.yml
│ └── workflows
│ └── ci.yml
├── .gitattributes
├── .gitignore
├── .husky
│ ├── \_
│ │ ├── .gitignore
│ │ └── husky.sh
│ ├── commit-msg
│ └── pre-commit
├── .prettierrc
├── .turbo
├── @progress.md
├── @project-status.md
├── apps
│ └── api
│ ├── .env
│ ├── .env.example
│ ├── .prettierrc
│ ├── .turbo
│ ├── dist
│ ├── jest.config.ts
│ ├── nest-cli.json
│ ├── node_modules
│ ├── package.json
│ ├── README.md
│ ├── src
│ │ ├── app.controller.spec.ts
│ │ ├── app.controller.ts
│ │ ├── app.module.ts
│ │ ├── app.service.ts
│ │ ├── config
│ │ │ ├── data-source.ts
│ │ │ ├── redis.config.ts
│ │ │ ├── redis.service.ts
│ │ │ ├── swagger.config.ts
│ │ │ └── typeorm.config.ts
│ │ ├── core
│ │ │ ├── core.module.ts
│ │ │ ├── decorators
│ │ │ │ └── public.decorator.ts
│ │ │ ├── filters
│ │ │ │ └── http-exception.filter.ts
│ │ │ ├── guards
│ │ │ │ └── jwt-auth.guard.ts
│ │ │ ├── interceptors
│ │ │ │ └── transform.interceptor.ts
│ │ │ └── pipes
│ │ │ └── validation.pipe.ts
│ │ ├── database
│ │ │ ├── migrations
│ │ │ │ ├── 1680268800000-CreateUsers.ts
│ │ │ │ ├── 1680268900000-AddPostGISAndDepartments.ts
│ │ │ │ ├── 1680269000000-CreateCategoriesAndReportsTable.ts
│ │ │ │ ├── 1680269100000-CreateMediaTable.ts
│ │ │ │ └── 1680269200000-AddPerformanceIndexes.ts
│ │ │ ├── ormconfig.ts
│ │ │ └── seeds
│ │ │ ├── categories.seed.ts
│ │ │ ├── departments.seed.ts
│ │ │ ├── index.ts
│ │ │ ├── reports.seed.ts
│ │ │ └── users.seed.ts
│ │ ├── main.ts
│ │ ├── modules
│ │ │ ├── auth
│ │ │ │ ├── auth.module.ts
│ │ │ │ ├── controllers
│ │ │ │ │ └── auth.controller.ts
│ │ │ │ ├── decorators
│ │ │ │ │ └── roles.decorator.ts
│ │ │ │ ├── dto
│ │ │ │ │ ├── login.dto.ts
│ │ │ │ │ └── register.dto.ts
│ │ │ │ ├── guards
│ │ │ │ │ ├── jwt.guard.ts
│ │ │ │ │ └── roles.guard.ts
│ │ │ │ ├── interfaces
│ │ │ │ │ ├── jwt-payload.interface.ts
│ │ │ │ │ └── token.interface.ts
│ │ │ │ ├── services
│ │ │ │ │ ├── auth.service.ts
│ │ │ │ │ └── token.service.ts
│ │ │ │ └── strategies
│ │ │ │ ├── jwt.strategy.ts
│ │ │ │ └── refresh.strategy.ts
│ │ │ ├── media
│ │ │ │ ├── controllers
│ │ │ │ │ ├── media.controller.spec.ts
│ │ │ │ │ └── media.controller.ts
│ │ │ │ ├── dto
│ │ │ │ │ └── upload-file.dto.ts
│ │ │ │ ├── entities
│ │ │ │ │ └── media.entity.ts
│ │ │ │ ├── interceptors
│ │ │ │ │ └── file-upload.interceptor.ts
│ │ │ │ ├── interfaces
│ │ │ │ │ ├── file-metadata.interface.ts
│ │ │ │ │ └── multer-file.interface.ts
│ │ │ │ ├── media.module.ts
│ │ │ │ └── services
│ │ │ │ ├── image-processor.service.spec.ts
│ │ │ │ ├── image-processor.service.ts
│ │ │ │ ├── media.service.spec.ts
│ │ │ │ ├── media.service.ts
│ │ │ │ ├── minio.service.spec.ts
│ │ │ │ └── minio.service.ts
│ │ │ ├── reports
│ │ │ │ ├── controllers
│ │ │ │ │ ├── category.controller.ts
│ │ │ │ │ ├── report-analytics.controller.ts
│ │ │ │ │ └── reports.controller.ts
│ │ │ │ ├── dto
│ │ │ │ │ ├── analytics.dto.ts
│ │ │ │ │ ├── category.dto.ts
│ │ │ │ │ ├── create-report.dto.ts
│ │ │ │ │ ├── department.dto.ts
│ │ │ │ │ ├── forward-report.dto.ts
│ │ │ │ │ ├── location.dto.ts
│ │ │ │ │ └── update-report.dto.ts
│ │ │ │ ├── entities
│ │ │ │ │ ├── department-history.entity.ts
│ │ │ │ │ ├── department.entity.ts
│ │ │ │ │ ├── report-category.entity.ts
│ │ │ │ │ ├── report-media.entity.ts
│ │ │ │ │ └── report.entity.ts
│ │ │ │ ├── interfaces
│ │ │ │ │ ├── report.analytics.interface.ts
│ │ │ │ │ └── report.interface.ts
│ │ │ │ ├── repositories
│ │ │ │ │ ├── category.repository.ts
│ │ │ │ │ ├── department.repository.ts
│ │ │ │ │ └── report.repository.ts
│ │ │ │ ├── reports.module.ts
│ │ │ │ └── services
│ │ │ │ ├── category.service.ts
│ │ │ │ ├── department.service.spec.ts
│ │ │ │ ├── department.service.ts
│ │ │ │ ├── location.service.ts
│ │ │ │ ├── report-analytics.service.spec.ts
│ │ │ │ ├── report-analytics.service.ts
│ │ │ │ ├── reports.service.spec.ts
│ │ │ │ └── reports.service.ts
│ │ │ └── users
│ │ │ ├── controllers
│ │ │ │ └── users.controller.ts
│ │ │ ├── dto
│ │ │ │ ├── create-user.dto.ts
│ │ │ │ ├── update-user.dto.ts
│ │ │ │ └── user-profile.dto.ts
│ │ │ ├── entities
│ │ │ │ └── user.entity.ts
│ │ │ ├── interfaces
│ │ │ │ └── user.interface.ts
│ │ │ ├── repositories
│ │ │ │ └── user.repository.ts
│ │ │ ├── services
│ │ │ │ ├── users.service.spec.ts
│ │ │ │ └── users.service.ts
│ │ │ └── users.module.ts
│ │ └── shared
│ │ ├── dto
│ │ ├── entities
│ │ │ └── base.entity.ts
│ │ ├── interfaces
│ │ ├── shared.module.ts
│ │ └── utils
│ ├── tsconfig.build.json
│ └── tsconfig.json
├── commitlint.config.js
├── docker-compose.yml
├── docs
│ ├── api-docs.md
│ ├── architecture.md
│ ├── impl-faz1.md
│ ├── impl-faz10.md
│ ├── impl-faz11.md
│ ├── impl-faz2.md
│ ├── impl-faz3.md
│ ├── impl-faz4.md
│ ├── impl-faz5.md
│ ├── impl-faz6.md
│ ├── impl-faz7.md
│ ├── impl-faz8.md
│ ├── impl-faz9.md
│ ├── project-planning.md
│ ├── requirements.md
│ ├── rfc
│ │ ├── RFC-001-architecture.md
│ │ ├── RFC-002-auth.md
│ │ ├── RFC-003-maps.md
│ │ ├── RFC-004-reporting.md
│ │ ├── RFC-005-notifications.md
│ │ ├── RFC-006-api.md
│ │ ├── RFC-007-mobile.md
│ │ ├── RFC-008-testing.md
│ │ └── RFC-009-refactoring.md
│ ├── rfc-docs.md
│ ├── sprint-1-plan.md
│ ├── sprint-2-plan.md
│ ├── sprint-2.5-plan.md
│ ├── sprint-3-plan.md
│ ├── sprint-4-plan.md
│ ├── sprint-5-plan.md
│ ├── sprint-6-plan.md
│ ├── technical-docs.md
│ └── test-docs.md
├── eslint.config.js
├── fix-nonnull-properties.js
├── jest.config.ts
├── node_modules
├── package.json
├── packages
│ ├── shared
│ │ ├── .turbo
│ │ ├── coverage
│ │ ├── jest.config.ts
│ │ ├── node_modules
│ │ ├── package.json
│ │ ├── src
│ │ │ ├── **tests**
│ │ │ │ └── utils
│ │ │ │ ├── formatting.test.ts
│ │ │ │ └── validation.test.ts
│ │ │ ├── constants
│ │ │ │ ├── api.ts
│ │ │ │ ├── app.ts
│ │ │ │ ├── errors.ts
│ │ │ │ ├── index.ts
│ │ │ │ └── regex.ts
│ │ │ ├── index.ts
│ │ │ ├── types
│ │ │ │ ├── index.ts
│ │ │ │ ├── report.types.ts
│ │ │ │ └── user.types.ts
│ │ │ └── utils
│ │ │ ├── formatting.ts
│ │ │ ├── index.ts
│ │ │ └── validation.ts
│ │ └── tsconfig.json
│ └── ui
│ ├── .turbo
│ ├── jest.config.ts
│ ├── node_modules
│ ├── package.json
│ ├── src
│ │ ├── components
│ │ │ ├── Button
│ │ │ │ └── index.tsx
│ │ │ ├── Card
│ │ │ │ ├── Card.tsx
│ │ │ │ └── index.tsx
│ │ │ └── Input
│ │ │ ├── index.tsx
│ │ │ └── Input.tsx
│ │ ├── hooks
│ │ │ ├── useAuth
│ │ │ │ └── index.tsx
│ │ │ └── useForm
│ │ │ └── index.tsx
│ │ ├── index.ts
│ │ └── test-setup.ts
│ └── tsconfig.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── project-structure.md
├── project-structure.txt
├── README.md
├── scripts
│ ├── check-services.js
│ ├── init-postgis.sql
│ └── reset-db.js
├── test-hook.md
├── tree.txt
├── tsconfig.json
└── turbo.json
