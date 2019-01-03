package fi.fta.data.dao;

import org.hibernate.HibernateException;

import fi.fta.beans.Category;
import fi.fta.beans.LayerService;

public class LayerServiceDAO<S extends LayerService> extends CategoryBeanDAO<S>
{
	
	public LayerServiceDAO(Class<S> cls)
	{
		super(cls);
	}
	
	public Category getParent(Long id) throws HibernateException
	{
		StringBuilder sb = new StringBuilder("SELECT cp.* FROM ").append(new CategoryDAO().getTableName()).append(" cp");
		sb.append(" LEFT JOIN ").append(this.getTableName()).append(" s ON cp.id = s.parent");
		sb.append(" WHERE s.id = ").append(id);
		return new DAOSelectUniqueQueryUtil<>(
			this.getCurrentSession(), sb.toString(), Category.class).executeNativeQuery();
	}
	
}
