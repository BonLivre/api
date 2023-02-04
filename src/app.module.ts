import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { FileManagerService } from './common/file-manager.service'
import { AuthModule } from './modules/auth/auth.module'
import { BooksModule } from './modules/books/books.module'
import { ReviewsModule } from './modules/reviews/reviews.module'
import { UsersModule } from './modules/users/users.module'
import { MailsModule } from './modules/mails/mails.module'
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n'
import { join } from 'path'
import { GenresModule } from './modules/genres/genres.module'
import { ShelvesModule } from './modules/shelves/shelves.module'
import { ReadingsListsModule } from './modules/readings-lists/readings-lists.module'
import { CelebritiesModule } from './modules/celebrities/celebrities.module'
import { IndustriesModule } from './modules/industries/industries.module'
import { QuotesModule } from './modules/quotes/quotes.module';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, '../', '/i18n/'),
        watch: true,
      },
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    BooksModule,
    CelebritiesModule,
    ReviewsModule,
    ShelvesModule,
    UsersModule,
    MailsModule,
    GenresModule,
    ReadingsListsModule,
    IndustriesModule,
    QuotesModule,
  ],
  providers: [FileManagerService],
})
export class AppModule {}
