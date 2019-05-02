package fi.fta.data.dao;

import java.util.Date;
import java.util.List;

import org.hibernate.type.LongType;
import org.hibernate.type.StringType;
import org.hibernate.type.TimestampType;

import fi.fta.beans.CategoryBeanAction;
import fi.fta.beans.UserRole;

public class CategoryBeanActionDAO extends SimpleTableDAO<CategoryBeanAction>
{
	
	public CategoryBeanActionDAO()
	{
		super(CategoryBeanAction.class);
	}
	
	public List<CategoryBeanAction> get(Long userId, UserRole userRole, Date from, Date till)
	{
		StringBuilder sb = new StringBuilder("from ").append(this.getEntityName());
		if (userId != null || userRole != null || from != null || till != null)
		{
			sb.append(" where");
		}
		if (userId != null)
		{
			sb.append(" userId = :userId");
		}
		if (userRole != null)
		{
			if (userId != null)
			{
				sb.append(" and");
			}
			sb.append(" role = :userRole");
		}
		if (from != null)
		{
			if (userId != null || userRole != null)
			{
				sb.append(" and");
			}
			sb.append(" created >= :from");
		}
		if (till != null)
		{
			if (userId != null | userRole != null || from != null)
			{
				sb.append(" and");
			}
			sb.append(" created < :till");
		}
		sb.append(" order by created desc");
		DAOSelectQueryUtil<CategoryBeanAction> q = new DAOSelectQueryUtil<>(
			this.getCurrentSession(), sb.toString(), CategoryBeanAction.class);
		if (userId != null)
		{
			q.setParameter("userId", userId, LongType.INSTANCE);
		}
		if (userRole != null)
		{
			q.setParameter("userRole", userRole.toString(), StringType.INSTANCE);
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
