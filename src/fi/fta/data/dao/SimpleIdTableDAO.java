package fi.fta.data.dao;

import java.util.List;

import org.hibernate.HibernateException;
import org.hibernate.type.LongType;

import fi.fta.beans.Identifiable;


public class SimpleIdTableDAO<T extends Identifiable<Long>> extends SimpleTableDAO<T>
{
	
	public SimpleIdTableDAO(Class<T> entityClass)
	{
		super(entityClass);
	}
	
	public SimpleIdTableDAO(Class<T> entityClass, boolean single)
	{
		super(entityClass, single);
	}
	
	public int delete(final Long id) throws HibernateException
	{
		StringBuilder sb = new StringBuilder("delete from ").append(this.getEntityName());
		sb.append(" where id = :id");
		return new DAOUpdateQueryUtil(this.getCurrentSession(), sb.toString()).
			setParameter("id", id, LongType.INSTANCE).executeQuery();
	}
	
	public List<Long> getAllIds() throws HibernateException
	{
		StringBuilder sb = new StringBuilder("select id from ").append(this.getEntityName());
		return new DAOSelectQueryUtil<>(
			this.getCurrentSession(), sb.toString(), Long.class).executeQuery();
	}
	
}
