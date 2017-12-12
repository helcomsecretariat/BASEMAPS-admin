package fi.fta.velocity;

import java.text.DateFormat;
import java.util.Calendar;
import java.util.Date;

import fi.fta.beans.MailType;
import fi.fta.utils.DateAndTimeUtils;

public class MailTemplate extends VelocityTemplate
{
	
	public MailTemplate(MailType type, String name)
	{
		super("mail/" + type.getType() + "/" + name);
	}
	
	public void setTitle(String title)
	{
		this.set("title", title);
	}
	
	public String getTitle()
	{
		return (String)this.get("title");
	}
	
	public void setContent(String content)
	{
		this.set("content", content);
	}
	
	public String getContent()
	{
		return (String)this.get("content");
	}
	
	public void setCode(String code)
	{
		this.set("code", code);
	}
	
	public String getCode()
	{
		return (String)this.get("code");
	}
	
	public void setDate()
	{
		this.setDate(Calendar.getInstance().getTime());
		this.setDateFormat();
	}
	
	public void setDate(Date date)
	{
		this.set("date", date);
	}
	
	public Date getDate()
	{
		return (Date)this.get("date");
	}
	
	public void setDateFormat()
	{
		this.setDateFormat(DateAndTimeUtils.SQLDF);
	}
	
	public void setDateFormat(DateFormat df)
	{
		this.set("df", df);
	}
	
	public DateFormat getDateFormat()
	{
		return (DateFormat)this.get("df");
	}
	
	public void setFooter(String footer)
	{
		this.set("footer", footer);
	}
	
	public String getFooter()
	{
		return (String)this.get("footer");
	}
	
	public void setId(Long id)
	{
		this.set("id", id);
	}
	
	public Long getId()
	{
		return (Long)this.get("id");
	}
	
	public void setEmail(String email)
	{
		this.set("email", email);
	}
	
	public String getEmail()
	{
		return (String)this.get("email");
	}
	
	public void setNn(Boolean nn)
	{
		this.set("nn", nn);
	}
	
	public Boolean getNn()
	{
		return (Boolean)this.get("nn");
	}
	
}
