// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
// import { AppService } from './app.service'; // No longer needed if simplified

@ApiTags('root')
@Controller() // No path prefix here
export class AppController {
  // constructor(private readonly appService: AppService) {} // Remove if AppService not used

  @Get() // This will now map to GET /api because of the global prefix
  @ApiOperation({ summary: 'API bilgileri' })
  getAppInfo(): { message: string; version?: string; docs: string } {
    // Example improved response
    return {
      message: 'KentNabız API',
      version: process.env.npm_package_version, // Get version from package.json
      docs: '/api/docs',
    };
  }

  // REMOVE THIS METHOD - it's no longer needed and would map to /api/api
  // @Get('api')
  // @ApiOperation({ summary: 'API yönlendirme' })
  // @Redirect('/', 301)
  // redirectToRoot(): void {
  //   // Bu metot yönlendirmeyi sağlar
  // }
}
