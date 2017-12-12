package fi.fta.mail;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.mail.Authenticator;
import javax.mail.BodyPart;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.internet.AddressException;

import fi.fta.beans.MailSettingsFacade;
import fi.fta.beans.MailType;
import fi.fta.utils.Util;


public class Mailer
{
	
	protected static Map<String, Map<Integer, Mailer>> instances;
	
	protected Session session;
	
	protected MailSettingsFacade settings;
	
	protected MailerQueue queue;
	
	protected volatile Thread thread;
	
	protected Mailer(MailSettingsFacade s)
	{
		Properties p = new Properties();
		p.put("mail.transport.protocol", "smtp");
		p.put("mail.host", s.getSmtp());
		p.put("mail.smtp.host", s.getSmtp());
		p.put("mail.smtp.localhost", s.getSmtp());
		if (s.getPort() != null)
		{
			p.put("mail.port", s.getPort());
			p.put("mail.smtp.port", s.getPort());
		}
		
		if (!Util.isEmptyString(s.getSmtpUser()))
		{
			p.put("mail.starttls.enable", "true");
            p.put("mail.smtp.starttls.enable", "true");
            p.put("mail.auth", "true");
            p.put("mail.smtp.auth", "true");
			this.session = Session.getInstance(p, new SimpleAuthenticator(s.getSmtpUser(), s.getSmtpPassword()));
		}
		else
		{
			this.session = Session.getInstance(p);
		}
		this.settings = s;
		this.queue = MailerQueue.createRuntimeDependingQueue();
	}
	
	public static Mailer get(MailSettingsFacade s)
	{
		if (instances == null)
			instances = new HashMap<String, Map<Integer, Mailer>>();
		
		if (instances.get(s.getSmtp()) == null)
			instances.put(s.getSmtp(), new HashMap<Integer, Mailer>());
		
		if (instances.get(s.getSmtp()).get(s.getPort()) == null)
			instances.get(s.getSmtp()).put(s.getPort(), new Mailer(s));
		
		return instances.get(s.getSmtp()).get(s.getPort());
	}
	
	protected boolean started()
	{
		return thread != null && thread.isAlive();
	}
	
	protected void start()
	{
		thread = new Thread(new MailerSender(this.session, this.settings, this.queue));
		thread.start();
	}
	
	public void queue(
		Short priority, MailType type,
		String to, String subject, String text, String from, String replyTo,
		List<BodyPart> multiparts)
	{
		try
		{
			this.queue.put(
				priority, new MailMessage(type.getContentType(), to, subject, text, from, replyTo, multiparts));
		}
		catch (AddressException ex)
		{
			ex.printStackTrace();
		}
		
		if (!this.started())
			this.start();
	}
	
	public void queue(
		Short priority, MailType type,
		List<String> to, String subject, String text, String from, String replyTo,
		List<BodyPart> multiparts)
	{
		for (String t : to)
		{
			try
			{
				this.queue.put(
					priority, new MailMessage(type.getContentType(), t, subject, text, from, replyTo, multiparts));
			}
			catch (AddressException ex)
			{
				ex.printStackTrace();
			}
			
			if (!this.started())
				this.start();
		}
	}
	
	public void finishQueue()
	{
		this.queue.end();
		this.queue = MailerQueue.createRuntimeDependingQueue();
		this.thread = null;
	}
	
	private static class SimpleAuthenticator extends Authenticator
	{
		private String user = null;
		private String password = null;
		
		public SimpleAuthenticator(String user, String password)
		{
			this.user = user;
			this.password = password;
		}
		
		public PasswordAuthentication getPasswordAuthentication()
		{
			return new PasswordAuthentication(user, password);
		}
		
	}
	
}
