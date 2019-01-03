package fi.fta.data.dao;

import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hibernate.HibernateException;
import org.hibernate.type.IntegerType;
import org.hibernate.type.LongType;

import fi.fta.beans.CategoryBean;
import fi.fta.beans.CountBean;

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

	public List<T> getByParent(Long parent) throws HibernateException
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
	
	public Map<Long, Integer> countByParent() throws HibernateException
	{
		StringBuilder sb = new StringBuilder("select new ");
		sb.append(CountBean.class.getName()).append("(parent, count(*)) from ").append(this.getEntityName());
		sb.append(" group by 1");
		Map<Long, Integer> ret = new HashMap<>();
		new DAOSelectQueryUtil<CountBean>(
			this.getCurrentSession(), sb.toString(), CountBean.class).executeQuery().forEach(
				(bean)->{ret.put(bean.getId(), bean.getCount());});
		return ret;
	}
	
}
