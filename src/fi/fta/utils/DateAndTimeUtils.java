package fi.fta.utils;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

public class DateAndTimeUtils
{
	
	public static SimpleDateFormat HF = new SimpleDateFormat("yyyy.MM.dd:HH");
	public static SimpleDateFormat MINF = new SimpleDateFormat("yyyy MM dd HH:mm");
	public static SimpleDateFormat SPACE_FS = new SimpleDateFormat("yyyy MM dd");
	public static SimpleDateFormat NO_SEP_FS = new SimpleDateFormat("yyyyMMdd");
	
	public static SimpleDateFormat SQLDF = new SimpleDateFormat("yyyy-MM-dd");
	public static SimpleDateFormat SQLTF = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSZ");
	public static SimpleDateFormat SQLMF = new SimpleDateFormat("yyyy-MM-dd HH:mm");
	public static SimpleDateFormat SQLSHF = new SimpleDateFormat("HH:mm");
	
	public static SimpleDateFormat RSSEN = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z", new Locale("en"));
	public static SimpleDateFormat TTFL = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
	public static SimpleDateFormat TTFS = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
	
	public static SimpleDateFormat DTF = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	public static SimpleDateFormat TF = new SimpleDateFormat("HH:mm:ss");
	
	
	private static Date dateFromText(String text, DateFormat format, Date defaultDate)
	{
		try
		{
			return format.parse(text);
		}
		catch (NullPointerException ex)
		{
			return defaultDate;
		}
		catch (ParseException ex)
		{
			return defaultDate;
		}
	}
	
	private static Date dateFromText(String text, DateFormat format) throws ParseException
	{
		return format.parse(text);
	}
	
	private static String dateToText(Date d, DateFormat format)
	{
		if (d == null)
			return null;
		return format.format(d);
	}
	
	
	public static Date dateFromSQLDateF(String text, Date defaultDate)
	{
		return dateFromText(text, DateAndTimeUtils.SQLDF, defaultDate);
	}
	
	public static Date dateFromSQLDateF(String text) throws ParseException
	{
		return dateFromText(text, DateAndTimeUtils.SQLDF);
	}
	
	public static Date dateFromSQLMinuteF(String text) throws ParseException
	{
		return dateFromText(text, DateAndTimeUtils.SQLMF);
	}
	
	public static Date dateFromSQLShortHourF(String text) throws ParseException
	{
		return dateFromText(text, DateAndTimeUtils.SQLSHF);
	}
	
	public static Date dateFromRSSText(String text) throws ParseException
	{
		return dateFromText(text, DateAndTimeUtils.RSSEN);
	}
	
	public static Date dateFromTLText(String text) throws ParseException
	{
		return dateFromText(text, DateAndTimeUtils.TTFL);
	}
	
	public static Date dateFromTSText(String text) throws ParseException
	{
		return dateFromText(text, DateAndTimeUtils.TTFS);
	}
	
	
	public static String dateToHF(Date date)
	{
		return dateToText(date, DateAndTimeUtils.HF);
	}
	
	public static String dateToMinF(Date date)
	{
		return dateToText(date, DateAndTimeUtils.MINF);
	}
	
	public static String dateToSpaceF(Date date)
	{
		return dateToText(date, DateAndTimeUtils.SPACE_FS);
	}
	
	public static String dateToNoSeparatorF(Date date)
	{
		return dateToText(date, DateAndTimeUtils.NO_SEP_FS);
	}
	
	public static String dateToSQLDateF(Date date)
	{
		return dateToText(date, DateAndTimeUtils.SQLDF);
	}
	
	public static String dateToSQLTimeF(Date date)
	{
		return dateToText(date, DateAndTimeUtils.SQLTF);
	}
	
	public static String dateToSQLShortHourF(Date date)
	{
		return dateToText(date, DateAndTimeUtils.SQLSHF);
	}
	
	public static String dateToDTF(Date date)
	{
		return dateToText(date, DateAndTimeUtils.DTF);
	}
	
	public static String dateToTF(Date date)
	{
		return dateToText(date, DateAndTimeUtils.TF);
	}
	
	public static Date concatenateTime(Date date, Date time)
	{
		Calendar ret = Calendar.getInstance();
		ret.setTime(date);
		Calendar t = Calendar.getInstance();
		t.setTime(time);
		ret.set(Calendar.HOUR_OF_DAY, t.get(Calendar.HOUR_OF_DAY));
		ret.set(Calendar.MINUTE, t.get(Calendar.MINUTE));
		return ret.getTime();
	}
	
	public static Date asDate(LocalDate localDate)
	{
		return Date.from(localDate.atStartOfDay().atZone(ZoneId.systemDefault()).toInstant());
    }

	public static Date asDate(LocalDateTime localDateTime)
	{
		return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
	}
	
	public static LocalDate asLocalDate(Date date)
	{
		return Instant.ofEpochMilli(date.getTime()).atZone(ZoneId.systemDefault()).toLocalDate();
	}
	
	public static LocalDateTime asLocalDateTime(Date date)
	{
		return Instant.ofEpochMilli(date.getTime()).atZone(ZoneId.systemDefault()).toLocalDateTime();
	}
	
}
