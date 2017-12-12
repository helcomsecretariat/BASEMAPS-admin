package fi.fta.mail;

import java.io.UnsupportedEncodingException;
import java.util.Calendar;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.mail.Address;
import javax.mail.BodyPart;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.NoSuchProviderException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.mail.internet.MimeUtility;

import fi.fta.beans.MailSettingsFacade;
import fi.fta.utils.Util;


public class MailerSender implements Runnable
{
	
	public static final int MESSAGES_AT_TIME = 1000;
	public static final long SLEEP_ON_SEND_TIME = 1000L;
	
	private static Pattern UNSUBSCRIBE_URL_PATTERN = Pattern.compile(".*<a\\s+class=\"unsubscribe[^\"]*\"\\s+href=\"([^\"]*)\"[^>]*>.*", Pattern.DOTALL);
	
	protected Session session;
	
	protected MailSettingsFacade settings;
	
	protected Transport transport;
	
	protected MailerQueue queue;
	
	public MailerSender(Session session, MailSettingsFacade settings, MailerQueue queue)
	{
		this.session = session;
		this.settings = settings;
		try
		{
			this.transport = session.getTransport();
		}
		catch (NoSuchProviderException ex)
		{
			ex.printStackTrace();
		}
		this.queue = queue;
	}
	
	
	public void run()
	{
		System.out.println("Started sending [" + this.queue + "]");
		for (int j = 0; true; ++j)
		{
			MailMessage mail = this.queue.take();
			if (mail != null)
			{
				this.send(mail);
				if (j >= MailerSender.MESSAGES_AT_TIME)
				{
					this.sleep(MailerSender.SLEEP_ON_SEND_TIME);
					j = 0;
				}
			}
			else
			{
				if (transport != null)
				{
					try
					{
						transport.close();
					}
					catch (MessagingException ex)
					{
						ex.printStackTrace();
					}
				}
				System.out.println("Finished sending [" + this.queue + "]");
				return;
			}
		}
	}
	
	protected void sleep(long time)
	{
		try
		{
			System.out.println(Calendar.getInstance().getTime() + ": Sender sleeping (" + time + ")...");
			Thread.sleep(time);
		}
		catch (InterruptedException ex)
		{
			System.out.println(Calendar.getInstance().getTime() + ": Sender unable to sleep...");
			ex.printStackTrace();
		}
	}
	
	protected synchronized boolean send(MailMessage mail)
	{
		MimeMessage msg = new MimeMessage(this.session);
		try
		{
			msg.setSubject(MimeUtility.encodeText(mail.getSubject(), mail.getEncoding(), null));
			msg.addHeader("Precedence", "bulk");
			String unsubscribe = MailerSender.getUnsubscribe(mail.getText());
			if (!Util.isEmptyString(unsubscribe))
			{
				msg.addHeader("List-Unsubscribe-Post", "List-Unsubscribe=One-Click");
				msg.addHeader("List-Unsubscribe", unsubscribe);
			}
			
			MimeMultipart mp = new MimeMultipart();
			mp.setSubType("related");
			
			MimeBodyPart bp = new MimeBodyPart();
			bp.setContent(mail.getText(), mail.getContentType() + "; charset=" + mail.getEncoding());
			mp.addBodyPart(bp);
			
			if (mail.getMultiparts() != null)
			{
				for (BodyPart mbp : mail.getMultiparts())
					mp.addBodyPart(mbp);
			}
			
			msg.setContent(mp);
			msg.setSentDate(Calendar.getInstance().getTime());
			
			msg.setFrom(mail.getFrom());
			if (mail.getReplyTo() != null)
				msg.setReplyTo(new InternetAddress[] { mail.getReplyTo() });
			//else
			//	msg.setReplyTo(new InternetAddress[] { mail.getFrom() });
			
			try
			{
				msg.setRecipient(Message.RecipientType.TO, mail.getTo());
				
				if (transport == null)
				{
					Transport.send(msg);
				}
				else
				{
					if (!transport.isConnected())
					{
						transport.connect(settings.getSmtp(), settings.getPort(), settings.getSmtpUser(), settings.getSmtpPassword());
					}
					transport.sendMessage(msg, msg.getAllRecipients());
				}
				
				System.out.println("Message \"" + msg.getSubject() + "\" to " + mail.getTo() + " sent successfully");
				return true;
			}
			catch (Exception ex)
			{
				System.out.println("Exception was raised while sending mail.");
				System.out.println("\tReason: " + ex.getMessage());
				Address[] addresses = msg.getAllRecipients();
				if (addresses != null)
				{
					System.out.print("\tRecipients: ");
					for (int i = 0; i < addresses.length; ++i)
						System.out.print(addresses[i] + "; ");
					System.out.println();
				}
				else
					System.out.println("none");
				System.out.println("\tSubject: " + msg.getSubject());
			
				ex.printStackTrace(System.out);
			}
		}
		catch (MessagingException ex)
		{
			System.out.println("Error while formatting message:");
			ex.printStackTrace();
		} 
		catch (UnsupportedEncodingException ex)
		{
			System.out.println("Unsupported encoding:");
			ex.printStackTrace();
		}
		
		return false;
	}
	
	private static String getUnsubscribe(String content)
	{
		Matcher m = MailerSender.UNSUBSCRIBE_URL_PATTERN.matcher(content);
		if (m.matches())
		{
			return m.group(1).replaceAll("[\r\n]", "");
		}
		return null;
	}
	
	@Override
	protected void finalize() throws Throwable
	{
		System.out.println("GC: " + this);
		super.finalize();
	}
	
}
