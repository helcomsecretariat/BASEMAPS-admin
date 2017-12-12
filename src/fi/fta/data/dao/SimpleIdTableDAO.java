package fi.fta.data.dao;

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
		StringBuffer sb = new StringBuffer("delete from " + this.getEntityName());
		sb.append(" where id = :id");
		return new DAOUpdateQueryUtil(this.getCurrentSession(), sb.toString()).
			setParameter("id", id, LongType.INSTANCE).executeQuery();
	}
	
}
