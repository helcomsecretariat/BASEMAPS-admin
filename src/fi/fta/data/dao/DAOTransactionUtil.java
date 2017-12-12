package fi.fta.data.dao;

import java.util.function.BiFunction;

import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.Transaction;

public class DAOTransactionUtil<R>
{
	
	protected Session session;
	
	public DAOTransactionUtil(Session session)
	{
		this.session = session;
	}
	
	protected R transaction(BiFunction<Session, String, R> bifunc, String query) throws HibernateException
	{
		Transaction tx = session.getTransaction();
		try
		{
			if (!tx.isActive())
			{
				tx.begin();
			}
			R ret = bifunc.apply(session, query);
			tx.commit();
			return ret;
		}
		catch (HibernateException ex)
		{
			if (tx != null)
			{
				tx.rollback();
			}	
			throw ex;
		}
	}
	
}
