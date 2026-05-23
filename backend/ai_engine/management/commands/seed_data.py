"""
Django management command: python manage.py seed_data
Seeds the database with realistic sample HR data for demonstration.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from employees.models import Employee, Department
from users.models import UserProfile
import random
from datetime import date, timedelta


DEPARTMENTS = [
    'Engineering', 'Marketing', 'Sales', 'HR', 'Finance',
    'Operations', 'Research & Development', 'Customer Support'
]

JOB_ROLES = {
    'Engineering': ['Software Engineer', 'Senior Developer', 'DevOps Engineer', 'QA Engineer', 'Tech Lead'],
    'Marketing': ['Marketing Analyst', 'Content Manager', 'SEO Specialist', 'Brand Manager'],
    'Sales': ['Sales Executive', 'Account Manager', 'Business Development Rep', 'Sales Manager'],
    'HR': ['HR Analyst', 'Recruiter', 'HR Manager', 'Training Coordinator'],
    'Finance': ['Financial Analyst', 'Accountant', 'Finance Manager', 'Auditor'],
    'Operations': ['Operations Manager', 'Project Manager', 'Business Analyst', 'Process Engineer'],
    'Research & Development': ['Research Scientist', 'Product Manager', 'Data Scientist', 'ML Engineer'],
    'Customer Support': ['Support Specialist', 'Customer Success Manager', 'Technical Support Agent'],
}

FIRST_NAMES = [
    'Priya', 'Rahul', 'Amit', 'Sneha', 'Arjun', 'Divya', 'Vikram', 'Ananya',
    'Rohan', 'Kavya', 'Aditya', 'Pooja', 'Kiran', 'Siddharth', 'Meera',
    'Ravi', 'Nisha', 'Sanjay', 'Deepika', 'Mohit', 'Anjali', 'Nikhil',
    'Shreya', 'Varun', 'Kritika', 'Akash', 'Pallavi', 'Gaurav', 'Swati', 'Ayush'
]

LAST_NAMES = [
    'Sharma', 'Patel', 'Gupta', 'Singh', 'Verma', 'Mehta', 'Joshi', 'Kumar',
    'Agarwal', 'Mishra', 'Rao', 'Nair', 'Reddy', 'Iyer', 'Bose', 'Das',
    'Malhotra', 'Kapoor', 'Tiwari', 'Saxena'
]


class Command(BaseCommand):
    help = 'Seed database with sample HR data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding sample data...')
        self._create_hr_users()
        depts = self._create_departments()
        self._create_employees(depts)
        self.stdout.write(self.style.SUCCESS('\nDatabase seeded successfully!'))
        self.stdout.write('─' * 40)
        self.stdout.write('Login credentials:')
        self.stdout.write('  Username: admin | Password: admin123')
        self.stdout.write('  Username: hrmanager | Password: hr123456')
        self.stdout.write('─' * 40)

    def _create_hr_users(self):
        """Create HR user accounts."""
        # Admin user
        if not User.objects.filter(username='admin').exists():
            user = User.objects.create_superuser(
                username='admin',
                email='admin@mindpath.com',
                password='admin123',
                first_name='Shivang',
                last_name='Mishra'
            )
            UserProfile.objects.create(user=user, role='admin', department='Administration')
            self.stdout.write('Created admin user')

        # HR Manager
        if not User.objects.filter(username='hrmanager').exists():
            user = User.objects.create_user(
                username='hrmanager',
                email='hr@mindpath.com',
                password='hr123456',
                first_name='Shivang',
                last_name='Mishra'
            )
            UserProfile.objects.create(user=user, role='hr_manager', department='HR')
            self.stdout.write('Created HR manager user')

        # HR Analyst
        if not User.objects.filter(username='hranalyst').exists():
            user = User.objects.create_user(
                username='hranalyst',
                email='analyst@mindpath.com',
                password='analyst123',
                first_name='Shivang',
                last_name='Mishra'
            )
            UserProfile.objects.create(user=user, role='hr_analyst', department='HR')
            self.stdout.write('Created HR analyst user')

    def _create_departments(self):
        """Create departments."""
        depts = {}
        heads = ['Arjun Mehta', 'Kavya Reddy', 'Sanjay Patel', 'Meera Singh',
                 'Vikram Joshi', 'Divya Nair', 'Rohan Kumar', 'Ananya Rao']

        for i, name in enumerate(DEPARTMENTS):
            dept, created = Department.objects.get_or_create(
                name=name,
                defaults={'head_name': heads[i % len(heads)]}
            )
            depts[name] = dept
            if created:
                self.stdout.write(f'Created department: {name}')

        return depts

    def _create_employees(self, depts):
        """Create 50 sample employees."""
        if Employee.objects.count() >= 50:
            self.stdout.write('Employees already exist, skipping...')
            return

        random.seed(42)
        emp_count = 0

        for i in range(50):
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            dept_name = random.choice(DEPARTMENTS)
            dept = depts[dept_name]
            job_role = random.choice(JOB_ROLES[dept_name])

            age = random.randint(22, 58)
            years_at_company = random.randint(0, min(age - 22, 20))
            total_working = random.randint(years_at_company, age - 18)

            emp_id = f'EMP{1000 + i + 1}'

            # Skip if already exists
            if Employee.objects.filter(employee_id=emp_id).exists():
                continue

            hire_date = date.today() - timedelta(days=years_at_company * 365)

            Employee.objects.create(
                employee_id=emp_id,
                full_name=f'{first} {last}',
                email=f'{first.lower()}.{last.lower()}{i}@mindpath.com',
                gender=random.choice(['M', 'F']),
                age=age,
                marital_status=random.choice(['Single', 'Married', 'Divorced']),
                department=dept,
                job_role=job_role,
                job_level=random.randint(1, 5),
                status=random.choices(
                    ['active', 'on_leave', 'terminated'],
                    weights=[85, 10, 5]
                )[0],
                years_at_company=years_at_company,
                years_in_current_role=random.randint(0, years_at_company + 1),
                years_since_last_promotion=random.randint(0, min(years_at_company + 1, 10)),
                years_with_curr_manager=random.randint(0, min(years_at_company + 1, 8)),
                num_companies_worked=random.randint(0, 8),
                total_working_years=total_working,
                training_times_last_year=random.randint(0, 6),
                distance_from_home=random.randint(1, 50),
                monthly_income=random.randint(20000, 200000),
                percent_salary_hike=random.randint(11, 25),
                education=random.randint(2, 5),
                job_satisfaction=random.randint(1, 4),
                environment_satisfaction=random.randint(1, 4),
                relationship_satisfaction=random.randint(1, 4),
                work_life_balance=random.randint(1, 4),
                performance_rating=random.choices([3, 4], weights=[80, 20])[0],
                business_travel=random.choice(['Non-Travel', 'Travel_Rarely', 'Travel_Frequently']),
                overtime=random.choice([True, False, False]),  # 33% overtime
                attendance_percentage=round(random.uniform(70, 100), 1),
                hire_date=hire_date,
            )
            emp_count += 1

        self.stdout.write(f'Created {emp_count} employees')
