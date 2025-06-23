
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, CheckCircle, Clock, DollarSign, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PublicLanding = () => {
  const navigate = useNavigate();

  const services = [
    {
      name: 'Basic Can Cleaning',
      price: 25,
      features: ['Up to 2 trash cans', 'Eco-friendly cleaning', 'Deodorization'],
    },
    {
      name: 'Premium Can Cleaning',
      price: 45,
      features: ['Up to 4 trash cans', 'Deep sanitization', 'Odor elimination', 'Before/after photos'],
    },
    {
      name: 'Commercial Cleaning',
      price: 75,
      features: ['Large scale cleaning', 'Multiple bin types', 'Commercial sanitization', 'Scheduled maintenance'],
    },
  ];

  const benefits = [
    { icon: CheckCircle, title: 'Professional Service', description: 'Trained technicians with commercial-grade equipment' },
    { icon: Clock, title: 'Convenient Scheduling', description: 'One-time or recurring service options' },
    { icon: DollarSign, title: 'Affordable Pricing', description: 'Competitive rates with no hidden fees' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Trash2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">CleanCans Pro</span>
            </div>
            <Button onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional Trash Can Cleaning Service
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Keep your trash cans clean, sanitized, and odor-free with our professional cleaning service. 
            Eco-friendly solutions for residential and commercial properties.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-3"
            onClick={() => navigate('/login')}
          >
            Book Your Service Today
          </Button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose CleanCans Pro?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <benefit.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="border-2 hover:border-blue-300 transition-colors">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  <div className="text-3xl font-bold text-blue-600">${service.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" onClick={() => navigate('/login')}>
                    Book This Service
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Contact us today to schedule your first cleaning or set up recurring service
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-lg">(555) 123-4567</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-lg">info@cleancanspro.com</span>
            </div>
          </div>
          <Button 
            size="lg" 
            className="mt-8 text-lg px-8 py-3"
            onClick={() => navigate('/login')}
          >
            Book Online Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Trash2 className="h-6 w-6 text-blue-400" />
            <span className="ml-2 text-lg font-semibold">CleanCans Pro</span>
          </div>
          <p className="text-gray-400">© 2024 CleanCans Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLanding;
