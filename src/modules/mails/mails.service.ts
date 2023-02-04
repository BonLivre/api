import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import sendgrid from '@sendgrid/mail'
import { SendResetPasswordMailProps } from './send-reset-password-mail-props.type'
import { readFile } from 'fs/promises'
import { compile } from 'handlebars'
import { I18nContext } from 'nestjs-i18n'

@Injectable()
export class MailsService {
  private baseUrl: string
  private from: string

  constructor(private configService: ConfigService) {
    sendgrid.setApiKey(this.configService.get('SENDGRID_API_KEY'))

    this.baseUrl = this.configService.get('FRONTEND_BASE_URL')
    this.from = this.configService.get('EMAIL_ADDRESS')
  }

  private sendMail(mail: sendgrid.MailDataRequired) {
    return sendgrid.send(mail)
  }

  private async getHtmlFromTemplate(templatePath: string, data: Record<string, any>) {
    const templateFile = await readFile(`src/modules/mails/templates/${templatePath}.hbs`, 'utf8')

    const template = compile(templateFile)

    return template(data)
  }

  async sendResetPasswordMail(props: SendResetPasswordMailProps) {
    props.url = `${this.baseUrl}/reinitialiser-mot-de-passe/${props.token}`

    const i18n = I18nContext.current()

    const html = await this.getHtmlFromTemplate('/reset-password/' + i18n.lang, props)

    this.sendMail({
      from: this.from,
      to: props.email,
      subject: `BonLivre - ${i18n.translate('mails.resetPassword.subject')}`,
      html,
    })
  }
}
