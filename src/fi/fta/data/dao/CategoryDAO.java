package fi.fta.data.dao;

import java.util.Calendar;
import java.util.List;

import org.hibernate.HibernateException;
import org.hibernate.type.IntegerType;
import org.hibernate.type.LongType;

import fi.fta.beans.Category;

public class CategoryDAO extends SimpleIdTableDAO<Category>
{
	
	public CategoryDAO()
	{
		super(Category.class);
	}
	
	public Category update(Category ent) throws HibernateException
	{
		ent.setUpdated(Calendar.getInstance().getTime());
		return super.update(ent);
	}
	
	public List<Category> getRoot() throws HibernateException
	{
		StringBuffer sb = new StringBuffer("from ").append(this.getEntityName());
		sb.append(" where parent is null order by position");
		return new DAOSelectQueryUtil<Category>(this.getCurrentSession(), sb.toString(), Category.class).executeQuery();
	}
	
	public boolean position(Long id, Integer position) throws HibernateException
	{
		StringBuffer sb = new StringBuffer("update ").append(this.getEntityName());
		sb.append(" set position = :position where id = :id");
		return new DAOUpdateQueryUtil(this.getCurrentSession(), sb.toString()).
			setParameter("position", position, IntegerType.INSTANCE).
			setParameter("id", id, LongType.INSTANCE).
			executeQuery() > 0;
	}
	
}
