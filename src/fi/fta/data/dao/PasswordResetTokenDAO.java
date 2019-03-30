package fi.fta.data.dao;

import java.util.List;

import org.hibernate.HibernateException;
import org.hibernate.type.BooleanType;
import org.hibernate.type.LongType;

import fi.fta.beans.PasswordResetToken;

public class PasswordResetTokenDAO extends SimpleIdTableDAO<PasswordResetToken>
{
	
	public PasswordResetTokenDAO()
	{
		super(PasswordResetToken.class);
	}
	
	public List<PasswordResetToken> getByUser(Long userId) throws HibernateException
	{
		return super.getByField("userId", userId);
	}
	
	public List<PasswordResetToken> getByCode(String code) throws HibernateException
	{
		return super.getByField("code", code);
	}
	
	public boolean finish(Long id, boolean confirm) throws HibernateException
	{
		StringBuilder sb = new StringBuilder("update ").append(this.getEntityName());
		sb.append(" set finished = :finished, expire = now() where id = :id");
		return new DAOUpdateQueryUtil(this.getCurrentSession(), sb.toString()).
			setParameter("finished", confirm, BooleanType.INSTANCE).
			setParameter("id", id, LongType.INSTANCE).
			executeQuery() > 0;
	}
	
}
