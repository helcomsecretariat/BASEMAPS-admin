package fi.fta.data.dao;


import java.util.HashMap;
import java.util.Map;
import java.util.function.BiFunction;

import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.hibernate.type.Type;

import fi.fta.beans.Pair;


public abstract class DAOQueryUtil<T, R> extends DAOTransactionUtil<R>
{
	
	protected String query;
	
	protected Map<String, Pair<Object, Type>> params;
	
	protected Class<T> cls;
	
	
	public DAOQueryUtil(Session session, Class<T> cls)
	{
		super(session);
		this.cls = cls;
	}
	
	public DAOQueryUtil(Session session, String query, Class<T> cls)
	{
		this(session, cls);
		this.setQuery(query);
	}
	
	public void setQuery(String query)
	{
		this.query = query;
	}
	
	protected void set(String name, Object value, Type type)
	{
		if (params == null)
		{
			params = new HashMap<String, Pair<Object,Type>>();
		}
		params.put(name, new Pair<Object, Type>(value, type));
	}
	
	public abstract <Q extends DAOQueryUtil<T, R>> Q setParameter(String name, Object value, Type type);	
	
	protected Query<T> setParameters(Query<T> q)
	{
		if (params != null)
		{
			for (Map.Entry<String, Pair<Object, Type>> p : params.entrySet())
			{
				q.setParameter(p.getKey(), p.getValue().getFirst(), p.getValue().getSecond());
			}
		}
		return q;
	}
	
	protected R transaction(BiFunction<Session, String, R> bifunc) throws HibernateException
	{
		return super.transaction(bifunc, query);
	}
	
}
