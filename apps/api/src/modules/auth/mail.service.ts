import type { Transporter } from 'nodemailer';
import nodemailer from 'nodemailer';
import type { Env } from '../../config/env.js';
import { ACTIVATION_TOKEN_TTL_HOURS, PASSWORD_RESET_LINK_TTL_MINUTES } from './auth.constants.js';

let cached: Transporter | null = null;

function getTransport(env: Env): Transporter {
  if (!cached) {
    cached = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASS,
            }
          : undefined,
    });
  }
  return cached;
}

export async function sendAccountActivationLink(
  env: Env,
  to: string,
  rawToken: string,
): Promise<void> {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    throw new Error('SMTP is not configured (SMTP_USER/SMTP_PASS).');
  }
  const transport = getTransport(env);
  const url = `${env.WEB_URL}/activate?token=${encodeURIComponent(rawToken)}`;
  await transport.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: 'Activate your Nestora account',
    text: [
      'Your university administrator created a Nestora account for you.',
      '',
      'Activate your account and set your password:',
      url,
      '',
      `This link expires in ${ACTIVATION_TOKEN_TTL_HOURS} hours.`,
    ].join('\n'),
    html: [
      '<p>Your university administrator created a Nestora account for you.</p>',
      `<p><a href="${url}">Activate account</a></p>`,
      `<p style="color:#666;font-size:14px">Link expires in ${ACTIVATION_TOKEN_TTL_HOURS} hours.</p>`,
    ].join(''),
  });
}

export async function sendPasswordResetLink(env: Env, to: string, rawToken: string): Promise<void> {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    throw new Error('SMTP is not configured (SMTP_USER/SMTP_PASS).');
  }
  const transport = getTransport(env);
  const url = `${env.WEB_URL}/forgot-password/reset?token=${encodeURIComponent(rawToken)}`;
  await transport.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: 'Nestora password reset',
    text: [
      'We received a request to reset your Nestora password.',
      '',
      url,
      '',
      `This link expires in ${PASSWORD_RESET_LINK_TTL_MINUTES} minutes and can only be used once.`,
    ].join('\n'),
    html: [
      '<p>We received a request to reset your Nestora password.</p>',
      `<p><a href="${url}">Reset password</a></p>`,
      `<p style="color:#666;font-size:14px">Expires in ${PASSWORD_RESET_LINK_TTL_MINUTES} minutes. Single use.</p>`,
    ].join(''),
  });
}

/** Logged-in users verifying a changed email (OTP). */
export async function sendOtpEmail(
  env: Env,
  to: string,
  _purpose: string,
  code: string,
): Promise<void> {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    throw new Error('SMTP is not configured (SMTP_USER/SMTP_PASS).');
  }
  const transport = getTransport(env);
  await transport.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: 'Nestora verification code',
    text: `Your verification code is: ${code}\nIt expires in 10 minutes.`,
    html: `<p>Your verification code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p><p>This code expires in 10 minutes.</p>`,
  });
}

export async function sendPasswordChangedNotice(env: Env, to: string): Promise<void> {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    return;
  }
  const transport = getTransport(env);
  await transport.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: 'Your Nestora password was changed',
    text: 'Your password was changed. If this was not you, contact your administrator immediately.',
    html: '<p>Your password was changed. If this was not you, contact your administrator immediately.</p>',
  });
}
