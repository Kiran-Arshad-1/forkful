import React from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const SuccessBanner = ({ onContinue }) => (
  <div className="text-center py-6 px-4">
    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
      <Icon name="CheckCircle" size={36} color="var(--color-success)" />
    </div>
    <h2 className="text-2xl font-heading font-semibold text-foreground mb-2">
      Account Created!
    </h2>
    <p className="text-sm text-muted-foreground font-body mb-6 max-w-xs mx-auto">
      Welcome to ForkFul! Your account is ready. Choose a plan to start your 2-month free trial.
    </p>
    <Button
      variant="default"
      size="lg"
      fullWidth
      iconName="ArrowRight"
      iconPosition="right"
      onClick={onContinue}
    >
      Choose Your Plan
    </Button>
  </div>
);

export default SuccessBanner;