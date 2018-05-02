package fi.fta.data.dao;

import java.util.List;

import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.type.Type;

public class DAOSelectQueryUtil<T> extends DAOQueryUtil<T, List<T>>
{
	
	public DAOSelectQueryUtil(Session session, Class<T> cls)
	{
		super(session, cls);
	}
	
	public DAOSelectQueryUtil(Session session, String query, Class<T> cls)
	{
		super(session, query, cls);
	}
	
	public List<T> executeQuery() throws HibernateException
	{
		return this.transaction(this::doQuery);
	}
	
	public List<T> executeNativeQuery() throws HibernateException
	{
		return this.transaction(this::doNativeQuery);
	}
	
	@Override
	@SuppressWarnings("unchecked")
	public DAOSelectQueryUtil<T> setParameter(String name, Object value, Type type)
	{
		this.set(name, value, type);
		return this;
	}
	
	protected List<T> doQuery(Session session, String query) throws HibernateException
	{
		return this.setParameters(session.createQuery(query, cls)).getResultList();
	}
	
	protected List<T> doNativeQuery(Session session, String query) throws HibernateException
	{
		return this.setParameters(session.createNativeQuery(query, cls)).getResultList();
	}
	
}
