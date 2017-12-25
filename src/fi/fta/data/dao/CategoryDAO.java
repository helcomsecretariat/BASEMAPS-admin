package fi.fta.data.dao;

import java.util.Calendar;
import java.util.List;

import org.hibernate.HibernateException;

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
		sb.append(" where parent is null");
		return new DAOSelectQueryUtil<Category>(this.getCurrentSession(), sb.toString(), Category.class).executeQuery();
	}
	
}
