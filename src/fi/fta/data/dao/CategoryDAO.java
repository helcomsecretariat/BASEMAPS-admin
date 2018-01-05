package fi.fta.data.dao;

import java.util.List;

import org.hibernate.HibernateException;

import fi.fta.beans.Category;

public class CategoryDAO extends CategoryBeanDAO<Category>
{
	
	public CategoryDAO()
	{
		super(Category.class);
	}

	public List<Category> getRoot() throws HibernateException
	{
		StringBuffer sb = new StringBuffer("from ").append(this.getEntityName());
		sb.append(" where parent is null order by position");
		return new DAOSelectQueryUtil<Category>(this.getCurrentSession(), sb.toString(), Category.class).executeQuery();
	}
	
}
