package fi.fta.data.dao;

import java.util.Collection;

import org.hibernate.HibernateException;

import fi.fta.utils.HibernateUtil;

public class SimpleTableDAO<T> extends SimpleDAO<T>
{
	
	public SimpleTableDAO(Class<T> entityClass)
	{
		super(entityClass);
	}
	
	public SimpleTableDAO(Class<T> entityClass, boolean single)
	{
		super(entityClass, single);
	}
	
	public T add(T ent) throws HibernateException
	{
		return this.transaction(
			(session) -> {
				session.save(ent);
				return ent; });
	}
	
	public Collection<T> addAll(Collection<T> entities) throws HibernateException
	{
		return this.transaction(
			(session) -> {
				int count = 0;
				for (T ent : entities)
				{
					session.save(ent);
					if (++count % HibernateUtil.BATCH_SIZE == 0)
					{
						session.flush();
						session.clear();
					}
				}
				return entities;
			});
	}
	
	public T update(T ent) throws HibernateException
	{
		return this.transaction(
			(session) -> {
				session.update(ent);
				return ent;
			});
	}
	
	public Collection<T> updateAll(Collection<T> entities) throws HibernateException
	{
		return this.transaction(
			(session) -> {
				int count = 0;
				for (T ent : entities)
				{
					session.update(ent);
					if (++count % HibernateUtil.BATCH_SIZE == 0)
					{
						session.flush();
						session.clear();
					}
				}
				return entities;
			});
	}
	
	public void delete(T ent) throws HibernateException
	{
		this.transaction(
			(session) -> {
				session.delete(ent);
				return null;
			});
	}
	
	public void deleteAll(Collection<T> entities) throws HibernateException
	{
		this.transaction(
			(session) -> {
				int count = 0;
				for (T ent : entities)
				{
					session.delete(ent);
					if (++count % HibernateUtil.BATCH_SIZE == 0)
					{
						session.flush();
						session.clear();
					}
				}
				return null;
			});
	}
	
	public T merge(T ent) throws HibernateException
	{
		return this.transaction(
			(session) -> {
				session.merge(ent);
				session.flush();
				return ent;
			});
	}
	
}
