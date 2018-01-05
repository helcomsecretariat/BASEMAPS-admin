package fi.fta.utils;

import org.hibernate.HibernateException;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

public class HibernateUtil
{
	
	private static SessionFactory sessionFactory;
	
	public static int BATCH_SIZE = 50;
	
	public static void create() throws HibernateException
	{
		synchronized (HibernateUtil.class)
		{
			if (sessionFactory == null)
			{
				sessionFactory = new Configuration().configure("hibernate.cfg.xml").buildSessionFactory();
			}
		}
	}
	
	public static void close() throws HibernateException
	{
		if (sessionFactory != null && !sessionFactory.isClosed())
		{
			sessionFactory.close();
		}	
	}
	
	public static SessionFactory getSessionFactory()
	{
		if (sessionFactory == null)
		{
			HibernateUtil.create();
		}
		return sessionFactory;
	}
	
}
