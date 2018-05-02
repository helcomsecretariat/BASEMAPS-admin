package fi.fta.data.dao;

import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.type.Type;

public class DAOUpdateQueryUtil extends DAOQueryUtil<Object, Integer>
{
	
	public DAOUpdateQueryUtil(Session session, String query)
	{
		super(session, query, Object.class);
	}
	
	public int executeQuery() throws HibernateException
	{
		return this.transaction(this::doQuery).intValue();
	}
	
	public int executeNativeQuery() throws HibernateException
	{
		return this.transaction(this::doNativeQuery).intValue();
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public DAOUpdateQueryUtil setParameter(String name, Object value, Type type)
	{
		this.set(name, value, type);
		return this;
	}
	
	@SuppressWarnings("unchecked")
	protected int doQuery(Session session, String query) throws HibernateException
	{
		return this.setParameters(session.createQuery(query)).executeUpdate();
	}
	
	@SuppressWarnings("unchecked")
	protected int doNativeQuery(Session session, String query) throws HibernateException
	{
		return this.setParameters(session.createNativeQuery(query)).executeUpdate();
	}
	
}
