package fi.fta.data.dao;

import java.util.Optional;

import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.type.Type;

public class DAOSelectUniqueQueryUtil<T> extends DAOQueryUtil<T, T>
{
	
	public DAOSelectUniqueQueryUtil(Session session, String query, Class<T> cls)
	{
		super(session, query, cls);
	}
	
	public T executeQuery() throws HibernateException
	{
		return this.transaction(this::doQuery);
	}
	
	
	@Override
	@SuppressWarnings("unchecked")
	public DAOSelectUniqueQueryUtil<T> setParameter(String name, Object value, Type type)
	{
		this.set(name, value, type);
		return this;
	}
	
	protected T doQuery(Session session, String query) throws HibernateException
	{
		Optional<T> optional = this.setParameters(session.createQuery(query, cls)).uniqueResultOptional();
		return optional.isPresent() ? optional.get() : null;
	}
	
}
