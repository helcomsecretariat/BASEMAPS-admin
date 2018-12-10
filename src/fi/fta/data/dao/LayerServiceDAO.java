package fi.fta.data.dao;

import java.util.List;

import org.hibernate.HibernateException;
import org.hibernate.type.LongType;

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
	
	public List<S> getByParent(Long parent) throws HibernateException
	{
		return this.getByField("parent", parent, "position", true);
	}
	
	public int countByParent(Long parent) throws HibernateException
	{
		StringBuilder sb = new StringBuilder("select count(*) from ").append(this.getEntityName());
		sb.append(" where parent = :parent");
		DAOSelectUniqueQueryUtil<Long> q = new DAOSelectUniqueQueryUtil<>(
			this.getCurrentSession(), sb.toString(), Long.class);
		Long count = q.setParameter("parent", parent, LongType.INSTANCE).executeQuery();
		return count != null ? count.intValue() : 0;
	}
	
}
