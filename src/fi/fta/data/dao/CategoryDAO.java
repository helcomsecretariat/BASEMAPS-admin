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
		StringBuilder sb = new StringBuilder("from ").append(this.getEntityName());
		sb.append(" where parent is null order by position");
		return new DAOSelectQueryUtil<Category>(this.getCurrentSession(), sb.toString(), Category.class).executeQuery();
	}
	
	public Category getParent(Long id) throws HibernateException
	{
		StringBuilder sb = new StringBuilder("SELECT cp.* FROM ").append(this.getTableName()).append(" cp");
		sb.append(" LEFT JOIN ").append(this.getTableName()).append(" c ON cp.id = c.parent");
		sb.append(" WHERE c.id = ").append(id);
		return new DAOSelectUniqueQueryUtil<>(
			this.getCurrentSession(), sb.toString(), Category.class).executeNativeQuery();
	}
	
	public List<Category> getYoungest()
	{
		StringBuilder sb = new StringBuilder("SELECT p.* FROM ").append(this.getTableName()).append(" p");
		sb.append(" LEFT JOIN ").append(this.getTableName()).append(" c ON p.id = c.parent");
		sb.append(" WHERE c.id IS NULL");
		return new DAOSelectQueryUtil<>(
			this.getCurrentSession(), sb.toString(), Category.class).executeNativeQuery();
	}
	
}
