package fi.fta.validation;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import javax.validation.ConstraintViolation;
import javax.validation.Path;
import javax.validation.Validation;
import javax.validation.Validator;

public class ClassStructureAssessor
{
	
	private Validator validator;
	
	protected static final ClassStructureAssessor instance = new ClassStructureAssessor();
	
	public static final ClassStructureAssessor getInstance()
	{
		return instance;
	}
	
	public ClassStructureAssessor()
	{
		this.validator = Validation.buildDefaultValidatorFactory().getValidator();
	}
	
	public <T> List<ValidationMessage> validate(T target)
	{
		List<ValidationMessage> ret = new ArrayList<>();
		Set<ConstraintViolation<T>> violations = validator.validate(target);
		if (!violations.isEmpty())
		{
			for (ConstraintViolation<T> v : violations)
			{
				ret.add(this.format(v));
			}
		}
		return ret;
	}
	
	private <T> ValidationMessage format(ConstraintViolation<T> violation)
	{
		ValidationField field = this.formatRecursion(violation);
		return new ValidationMessage(violation.getMessage(), field);
	}
	
	private <T> ValidationField formatRecursion(ConstraintViolation<T> violation)
	{
		ValidationField firstField = null, lastField = null;
		Path pp = violation.getPropertyPath();
		if (pp != null)
		{
			Iterator<Path.Node> it = pp.iterator();
			while (it.hasNext())
			{
				Path.Node node = it.next();
				if (lastField != null && lastField.getChild() != null)
				{
					lastField = lastField.getChild();
				}
				ValidationField field = new ValidationField(node.getName());
				if (node.isInIterable())
				{
					field.setIndex(node.getIndex());
				}
				field.setParent(lastField);
				if (lastField == null)
				{
					lastField = field;
				}
				else
				{
					lastField.setChild(field);
				}
			}
			if (lastField != null)
			{
				firstField = lastField;
				while (firstField.getParent() != null)
				{
					firstField = firstField.getParent();
				}
			}
		}
		return firstField;
	}
	
}
