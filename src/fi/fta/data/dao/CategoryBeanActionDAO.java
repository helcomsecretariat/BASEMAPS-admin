package fi.fta.data.dao;

import java.util.Date;
import java.util.List;

import org.hibernate.type.LongType;
import org.hibernate.type.TimestampType;

import fi.fta.beans.CategoryBeanAction;

public class CategoryBeanActionDAO extends SimpleTableDAO<CategoryBeanAction>
{
	
	public CategoryBeanActionDAO()
	{
		super(CategoryBeanAction.class);
	}
	
	public List<CategoryBeanAction> get(Long userId, Date from, Date till)
	{
		StringBuilder sb = new StringBuilder("from ").append(this.getEntityName());
		if (userId != null || from != null || till != null)
		{
			sb.append(" where");
		}
		if (userId != null)
		{
			sb.append(" userId = :userId");
		}
		if (from != null)
		{
			if (userId != null)
			{
				sb.append(" and");
			}
			sb.append(" created >= :from");
		}
		if (till != null)
		{
			if (userId != null || from != null)
			{
				sb.append(" and");
			}
			sb.append(" created < :till");
		}
		DAOSelectQueryUtil<CategoryBeanAction> q = new DAOSelectQueryUtil<>(
			this.getCurrentSession(), sb.toString(), CategoryBeanAction.class);
		if (userId != null)
		{
			q.setParameter("userId", userId, LongType.INSTANCE);
		}
		if (from != null)
		{
			q.setParameter("from", from, TimestampType.INSTANCE);
		}
		if (till != null)
		{
			q.setParameter("till", till, TimestampType.INSTANCE);
		}
		return q.executeQuery();
	}
}
