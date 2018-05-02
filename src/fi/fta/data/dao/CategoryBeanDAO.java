package fi.fta.data.dao;

import java.util.Calendar;

import org.hibernate.HibernateException;
import org.hibernate.type.IntegerType;
import org.hibernate.type.LongType;

import fi.fta.beans.CategoryBean;

public class CategoryBeanDAO<T extends CategoryBean> extends SimpleIdTableDAO<T>
{
	
	public CategoryBeanDAO(Class<T> cls)
	{
		super(cls);
	}
	
	public T update(T ent) throws HibernateException
	{
		ent.setUpdated(Calendar.getInstance().getTime());
		return super.update(ent);
	}
	
	public boolean position(Long id, Integer position) throws HibernateException
	{
		StringBuilder sb = new StringBuilder("update ").append(this.getEntityName());
		sb.append(" set position = :position where id = :id");
		return new DAOUpdateQueryUtil(this.getCurrentSession(), sb.toString()).
			setParameter("position", position, IntegerType.INSTANCE).
			setParameter("id", id, LongType.INSTANCE).
			executeQuery() > 0;
	}
	
}
