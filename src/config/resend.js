import { Resend } from "resend";
import env from './environment.js';

const resend = new Resend(env.RESEND_API_KEY);
export default resend;